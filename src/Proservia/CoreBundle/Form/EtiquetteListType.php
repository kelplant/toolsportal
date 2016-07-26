<?php

namespace Proservia\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;

class EtiquetteListType extends AbstractType
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
                'label' => 'DSP',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un DSP',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('serial', TextType::class, array(
                'label' => 'Nom',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir un serial',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('product', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listeProduct"],
                'preferred_choices' => 'Choisir un Modèle',
                'multiple' => false,
                'label' => 'Categorie',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('buyMode', ChoiceType::class, array(
                'choices' => array('Achat' => 'Achat', 'Location' => 'Location'),
                'multiple' => false,
                'label' => 'Mode Acquis.',
                'label_attr' => array(
                    'class' => 'col-sm-3 control-label align_right font_exo_2',
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
            'data_class' => 'Proservia\CoreBundle\Entity\EtiquetteList'
        ));
    }
}
