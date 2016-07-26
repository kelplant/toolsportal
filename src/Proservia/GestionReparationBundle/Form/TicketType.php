<?php

namespace Proservia\GestionReparationBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\DateType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class TicketType extends AbstractType
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
            ->add('serial', TextType::class, array(
                'label' => 'S/N',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une numéro de Série',
                    'class' => 'form-control font_exo_2',
                ),
                'required' => true,
            ))
            ->add('site', ChoiceType::class, array(
                'choices' => $options["allow_extra_fields"]["listeSite"],
                'preferred_choices' => 'Choisir un Site',
                'multiple' => false,
                'label' => 'Localisation',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('buyMode', ChoiceType::class, array(
                'choices' => array('--' => '', 'Achat' => 'Achat', 'Location' => 'Location'),
                'preferred_choices' => 'Choisir un Site',
                'multiple' => false,
                'label' => 'Mode Acq.',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('status', ChoiceType::class, array(
                'choices' => array('Ouvert' => 'Ouvert', 'En Attente Client' => 'En Attente Client', 'En Attente Constructeur' => 'En Attente Constructeur', 'Résolu' => 'Résolu'),
                'multiple' => false,
                'label' => 'Statut',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('endOfWarranty', TextType::class, array(
                'label' => 'Fin Garantie',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Saisir une date',
                    'class' => 'form-control font_exo_2 datepicker',
                ),
                'required' => true,
            ))
            ->add('typeWarranty', ChoiceType::class, array(
                'choices' => array('--' => '', 'Intervention sur Site' => 'Intervention sur Site', 'Retour Atelier' => 'Retour Atelier'),
                'preferred_choices' => 'Type Garantie',
                'multiple' => false,
                'label' => 'Type Garantie',
                'label_attr' => array(
                    'class' => 'col-sm-4 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'class' => 'form-control font_exo_2 input-md select2-single',
                ),
                'required' => true,
            ))
            ->add('comment', TextareaType::class, array(
                'label' => 'Commentaires',
                'label_attr' => array(
                    'class' => 'col-sm-2 control-label align_right font_exo_2',
                ),
                'attr' => array(
                    'placeholder' => 'Commentaires',
                    'class' => 'form-control font_exo_2',
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
            'data_class' => 'Proservia\GestionReparationBundle\Entity\Ticket'
        ));
    }
}
