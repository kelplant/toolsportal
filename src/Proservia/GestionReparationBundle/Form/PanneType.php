<?php

namespace Proservia\GestionReparationBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class PanneType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('id', HiddenType::class, array(
                'label' => 'id',
            ))
            ->add('name', TextType::class, array(
                'label' => 'Panne',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une nouvelle catégorie',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('category', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listePanneCategory"],
                'preferred_choices' => 'Choisir une Catégorie',
                'multiple' => false,
                'label' => 'Categorie Panne',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
        ;
    }
    
    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'data_class' => 'Proservia\GestionReparationBundle\Entity\Panne'
        ));
    }
}
